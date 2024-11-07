describe('Smuggling Compartment', function() {
    integration(function(contextRef) {
        describe('Smuggling Compartment\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'snowspeeder', upgrades: ['smuggling-compartment'] }],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should ready a resource on attack', function () {
                const { context } = contextRef;

                const exhaustedResourcesBeforeAbility = context.player1.countExhaustedResources();

                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.atst);

                expect(context.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbility - 1);
            });
        });
    });
});
