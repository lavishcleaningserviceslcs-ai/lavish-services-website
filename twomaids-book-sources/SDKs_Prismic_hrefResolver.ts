const hrefResolver = (doc) => {
  if (doc.type === 'blog-post') {
    return '/blog/[uid]';
  }
  return '/';
};

export { hrefResolver as default };
