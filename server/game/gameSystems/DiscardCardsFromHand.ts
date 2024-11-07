import { CardTypeFilter, EventName, Location, RelativePlayer, TargetMode } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';
import { cardTypeMatches } from '../core/utils/EnumHelpers';
import { asArray } from '../core/utils/Helpers';
import { assertTrue } from '../core/utils/Contract';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount: number;

    /* TODO: Add reveal system to when card type filter or card condition exists, as this is required to keep the
    in order to keep the player honest in a in-person game */
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
}

export class DiscardCardsFromHand<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        cardCondition: () => true
    };

    public override name = 'discard';
    public override eventName = EventName.OnCardsDiscardedFromHand;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(_event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['make {0} discard {1} cards', [properties.target, properties.amount]];
    }

    public override canAffect(playerOrPlayers: Player | Player[], context: TContext, additionalProperties = {}, mustChangeGameState = false): boolean {
        for (const player of asArray(playerOrPlayers)) {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context) && cardTypeMatches(card.type, properties.cardTypeFilter));

            if (availableHand.length === 0 || properties.amount === 0) {
                return false;
            }

            if ((properties.isCost || mustChangeGameState) && availableHand.length <= properties.amount) {
                return false;
            }

            if (!super.canAffect(player, context, additionalProperties)) {
                return false;
            }
        }
        return true;
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (const player of properties.target as Player[]) {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));

            assertTrue(properties.amount > 0, 'Cards to discard must be greater than 0');

            const amount = Math.min(availableHand.length, properties.amount);

            if (amount === 0) {
                return;
            }

            if (amount >= availableHand.length) {
                this.generateEventsForCards(availableHand, context, events);
                return;
            }

            context.game.promptForSelect(player, {
                activePromptTitle: 'Choose ' + (amount === 1 ? 'a card' : amount + ' cards') + ' to discard',
                context: context,
                mode: TargetMode.Exactly,
                numCards: amount,
                locationFilter: Location.Hand,
                controller: player === context.player ? RelativePlayer.Self : RelativePlayer.Opponent,
                cardCondition: (card) => properties.cardCondition(card, context),
                onSelect: (_player, cards) => {
                    this.generateEventsForCards(cards, context, events);
                    return true;
                }
            });
        }
    }

    private generateEventsForCards(cards: Card[], context: TContext, events: any[]): void {
        cards.forEach((card) => {
            const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
            events.push(specificDiscardEvent);
        });
    }
}
