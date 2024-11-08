describe('Smuggling Compartment', function() {
    integration(function(contextRef) {
        describe('Smuggling Compartment\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'atst', upgrades: ['smuggling-compartment'] }],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });
            });

            it('should ready a resource on attack', function () {
                const { context } = contextRef;

                context.player1.exhaustResources(2);

                const exhaustedResourcesBeforeAbility = context.player1.countExhaustedResources();

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.snowspeeder);

                expect(context.player1.countExhaustedResources()).toBe(exhaustedResourcesBeforeAbility - 1);
            });
        });
    });
});
