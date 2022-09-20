declare type StytchProviderOptions = {
    env: string;
    debug: boolean;
};
declare function StytchProvider(this: any, options: StytchProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default StytchProvider;
