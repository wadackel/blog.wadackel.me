import { Child } from 'hono/jsx';

type Props = {
  children: Child;
};

export const PostContent = ({ children }: Props) => {
  return <div class="post-content">{children}</div>;
};
