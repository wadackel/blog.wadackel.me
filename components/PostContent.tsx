type Props = {
  children: unknown;
};

export const PostContent = ({ children }: Props) => {
  return <div class="post-content">{children}</div>;
};
