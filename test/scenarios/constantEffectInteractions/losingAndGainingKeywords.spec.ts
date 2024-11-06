describe('Losing and gaining keywords', function() {
    integration(function(contextRef) {
        describe('If a unit has a keyword given by a source, then loses that keyword due to an ability,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['wampa', 'crafty-smuggler']
                    },
                    player2: {
                        groundArena: ['vigilant-honor-guards'],
                        hand: ['protector', 'repair']
                    }
                });
            });

            it('it should be able to gain the keyword again from a different source', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.clickCard(context.protector);
                context.player2.clickCard(context.vigilantHonorGuards);

                context.player1.clickCard(context.wampa);

                // attack target chosen automatically due to sentinel
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInLocation('discard');
                expect(context.vigilantHonorGuards.damage).toBe(4);
            });

            it('it should not regain the keyword from that source after the source\'s condition toggles off then on', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.vigilantHonorGuards);

                context.player2.passAction();

                context.player1.clickCard(context.craftySmuggler);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(2);

                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.damage).toBe(0);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.vigilantHonorGuards, context.p2Base]);
            });
        });
    });
});
