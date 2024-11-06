import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Location, WildcardCardType, WildcardLocation } from '../../../core/Constants';

export default class KrrsantanMuscleForHire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3622749641',
            internalName: 'krrsantan#muscle-for-hire',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If an enemy unit has a Bounty, you may ready this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.opponent.getUnitsInPlay(WildcardLocation.AnyArena, (card) => card.hasSomeKeyword(KeywordName.Bounty)).length > 0,
                onTrue: AbilityHelper.immediateEffects.ready((context) => ({
                    target: context.source
                })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });

        this.addOnAttackAbility({
            title: 'You may deal 1 damage to it for each damage on this unit',
            targetResolver: {
                optional: true,
                locationFilter: Location.GroundArena,
                cardTypeFilter: WildcardCardType.Unit,
                condition: (context) => context.source.damage > 0,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.damage
                }))
            }
        });
    }
}

KrrsantanMuscleForHire.implemented = true;
