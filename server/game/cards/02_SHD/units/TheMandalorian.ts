import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TheMandalorian extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6585115122',
            internalName: 'the-mandalorian#wherever-i-go-he-goes',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'You may heal all damage from a unit that costs 2 or less and give 2 Shield tokens to it',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.heal((context) => ({ amount: this.getHealFromContext(context) })),
                    AbilityHelper.immediateEffects.giveShield({ amount: 2 })
                ])
            }
        });
    }

    private getHealFromContext(context: AbilityContext) {
        return context.target.damage
    }
}

TheMandalorian.implemented = true;
