describe('The Mandalorian, Wherever I Go He Goes', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#wherever-i-go-he-goes'],
                        groundArena: [ 
                            { card: 'grogu#irresistible', damage: 3 },
                            { card: 'mandalorian-warrior' }
                        ]
                    }
                })
            })

            it('should heal all damage and give 2 shield tokens to a unit', function () {
                const { context } = contextRef
                const promptMessage = 'You may heal all damage from a unit that costs 2 or less and give 2 Shield tokens to it'

                context.player1.clickCard(context.theMandalorian)

                expect(context.player1).toHavePassAbilityPrompt(promptMessage)
                context.player1.clickPrompt(promptMessage)

                expect(context.grogu.damage).toBe(0)
                expect(context.grogu).toHaveExactUpgradeNames(['shield', 'shield'])
            })

            it('should be passed', function () {
                const { context } = contextRef

                context.player1.clickCard(context.theMandalorian)
                expect(context.player1).toHavePassAbilityPrompt('You may heal all damage from a unit that costs 2 or less and give 2 Shield tokens to it')
                context.player1.clickPrompt('Pass')
                expect(context.grogu.damage).toBe(3)
                expect(context.grogu.isUpgraded()).toBeFalse()
                expect(context.player2).toBeActivePlayer()
            })
        })
    })
})
