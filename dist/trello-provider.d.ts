declare type TrelloProviderOptions = {};
declare function TrelloProvider(this: any, _options: TrelloProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default TrelloProvider;
