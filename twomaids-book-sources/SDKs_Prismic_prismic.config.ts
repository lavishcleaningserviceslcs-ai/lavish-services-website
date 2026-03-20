import Prismic from 'prismic-javascript';

export const apiEndpoint = 'https://two-maids-consumer-site.cdn.prismic.io/api/v2';
export const accessToken = process.env.prismicAccessToken;

const createClientOptions = (req = null, prismicAccessToken = null) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken ? { accessToken: prismicAccessToken } : {};
  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

// Client method to query documents from the Prismic repo
export const PrismicClient = (req = null) => (
  Prismic.client(apiEndpoint, createClientOptions(req, accessToken))
);
