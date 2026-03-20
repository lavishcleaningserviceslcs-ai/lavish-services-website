const linkResolver = (doc) => {
  // URL for a category type
  if (doc.type === 'blog-post') {
    return `/blog/${doc.uid}`;
  }

  return '/';
};

export { linkResolver as default };
