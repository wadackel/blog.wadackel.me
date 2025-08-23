type Props = {
  html: string;
};

export const TwitterWidgetsScript = ({ html }: Props) => {
  // Check if HTML contains twitter-tweet class
  const hasTwitterEmbed = html.includes('twitter-tweet');

  if (!hasTwitterEmbed) {
    return null;
  }

  return <script async src="https://platform.twitter.com/widgets.js" charset="utf-8" />;
};
