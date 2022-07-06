declare function GithubProvider(this: any, _options: any): {
    exports: {
        native: () => {
            octokit: import("@octokit/core").Octokit & {
                paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
            } & import("@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types").RestEndpointMethods & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api;
        };
    };
};
export default GithubProvider;
