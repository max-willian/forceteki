import { EventName, Location, RelativePlayer, TargetMode } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { Card } from '../core/card/Card';
import { DiscardSpecificCardSystem } from './DiscardSpecificCardSystem';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount?: number;
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

    public override canAffect(playerOrPlayers: Player | Player[], context: TContext, additionalProperties = {}): boolean {
        const players = Array.isArray(playerOrPlayers) ? playerOrPlayers : [playerOrPlayers];
        return players.every((player) => {
            const properties = this.generatePropertiesFromContext(context, additionalProperties);
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));

            if (availableHand.length === 0 || properties.amount === 0) {
                return false;
            }
            return super.canAffect(player, context);
        });
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        (properties.target as Player[]).forEach((player) => {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));
            const amount = Math.min(availableHand.length, properties.amount);
            if (amount <= 0) {
                return;
            }

            if (amount >= availableHand.length) {
                this.generateEventsForCards(availableHand, context, events);
                return;
            }

            if (context.choosingPlayerOverride && context.choosingPlayerOverride !== player) {
                this.generateEventsForCards(availableHand.slice(0, amount), context, events);
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
        });
    }

    private generateEventsForCards(cards: Card[], context: TContext, events: any[]): void {
        cards.forEach((card) => {
            const specificDiscardEvent = new DiscardSpecificCardSystem({ target: card }).generateEvent(context);
            events.push(specificDiscardEvent);
        });
    }
}
