import { EventName, Location, RelativePlayer, TargetMode } from '../core/Constants';
import { AbilityContext } from '../core/ability/AbilityContext';
import type Player from '../core/Player';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import { Card } from '../core/card/Card';

export interface IDiscardCardsFromHandProperties extends IPlayerTargetSystemProperties {
    amount?: number;
    targets?: boolean;
    cardCondition?: (card: Card, context: AbilityContext) => boolean;
}

export class DiscardCardsFromHand<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscardCardsFromHandProperties> {
    protected override defaultProperties: IDiscardCardsFromHandProperties = {
        amount: 1,
        targets: true,
        cardCondition: () => true
    };
    public override name = 'discard';
    public override eventName = EventName.OnCardsDiscardedFromHand;

    public eventHandler(event): void {
        event.context.game.addMessage('{0} discards {1}', event.player, event.cards);
        event.discardedCards = event.cards;
        for (let card of event.cards) {
            event.player.moveCard(card, Location.Discard);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        let properties = this.generatePropertiesFromContext(context);
        return ['make {0} discard {1} cards', [properties.target, properties.amount]];
    }

    public override canAffect(player: Player, context: TContext, additionalProperties = {}): boolean {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));

        if (availableHand.length === 0 || properties.amount === 0) {
            return false;
        }
        return super.canAffect(player, context);
    }

    public override queueGenerateEventGameSteps(events: any[], context: TContext, additionalProperties: Record<string, any> = {}): void {
        let properties = this.generatePropertiesFromContext(context, additionalProperties);
        for (let player of properties.target as Player[]) {
            const availableHand = player.hand.filter((card) => properties.cardCondition(card, context));
            let amount = Math.min(availableHand.length, properties.amount);
            if (amount > 0) {
                if (amount >= availableHand.length) {
                    let event = this.generateEvent(context, additionalProperties) as any;
                    event.cards = availableHand;
                    events.push(event);
                    return;
                }

                if (properties.targets && context.choosingPlayerOverride && context.choosingPlayerOverride !== player) {
                    let event = this.generateEvent(context, additionalProperties) as any;
                    event.cards = availableHand.slice(0, amount);
                    events.push(event);
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
                        let event = this.generateEvent(context, additionalProperties) as any;
                        event.cards = cards;
                        events.push(event);
                        return true;
                    }
                });
            }
        }
    }

    protected override addPropertiesToEvent(event, player: Player, context: TContext, additionalProperties: Record<string, any>): void {
        let { amount } = this.generatePropertiesFromContext(context, additionalProperties);
        super.addPropertiesToEvent(event, player, context, additionalProperties);
        event.amount = amount;
        event.cards = [];
        event.discardedAtRandom = false;
    }
}
