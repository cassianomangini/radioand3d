export type ViewTransitionLike = {
  finished: Promise<void>;
};

export type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => ViewTransitionLike;
};

