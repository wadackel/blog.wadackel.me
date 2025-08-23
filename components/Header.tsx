import AnimatedLogo from '../app/islands/AnimatedLogo';

type Props = {
  home?: boolean;
};

export const Header = ({ home = false }: Props) => {
  const Text = home ? 'h1' : 'div';

  return (
    <header className="py-32">
      <div className="container text-center">
        <Text>
          <AnimatedLogo animatable />
        </Text>
      </div>
    </header>
  );
};
