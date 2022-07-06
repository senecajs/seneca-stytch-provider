declare type StytchProviderOptions = {};
declare function StytchProvider(this: any, _options: StytchProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default StytchProvider;
