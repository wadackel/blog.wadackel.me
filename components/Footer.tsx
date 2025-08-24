import { site } from '../lib/config';
import Logo from '../app/islands/Logo';
import { XIcon, GitHubIcon, FeedlyIcon, RssIcon } from './icons';

export const Footer = () => {
  const year = new Date().getFullYear();
  const feed = '/rss.xml';
  const feedEncoded = encodeURIComponent(`${site.url}/rss.xml`);

  return (
    <footer class="flex justify-center items-center h-footer text-white bg-[url('/footer-bg.jpg')] bg-[length:95px] antialiased">
      <div class="container">
        <div class="flex flex-col items-center text-center">
          <div
            class="flex justify-center items-center w-24 h-24 rounded-full bg-white text-primary-500"
            aria-hidden="true"
          >
            <div class="relative -left-1 w-16">
              <Logo />
            </div>
          </div>

          <p class="mt-5">
            <span class="block md:text-lg">和田 剛</span>
            <span class="block text-sm md:text-base font-accent leading-none md:leading-none">
              tsuyoshi wada
            </span>
          </p>

          <p class="mt-3 text-xs md:text-sm">ダックスフンド is かわいい。</p>

          <ul class="flex justify-center items-center mt-4">
            <li>
              <a class="block p-2 text-white" href={`https://x.com/${site.social.x}`}>
                <XIcon size={18} />
              </a>
            </li>

            <li>
              <a class="block p-2 text-white" href={`https://github.com/${site.social.github}`}>
                <GitHubIcon size={20} />
              </a>
            </li>

            <li>
              <a
                class="block p-2 text-white"
                href={`https://feedly.com/i/subscription/feed/${feedEncoded}`}
              >
                <FeedlyIcon size={20} />
              </a>
            </li>

            <li>
              <a class="block p-2 text-white" href={feed}>
                <RssIcon size={20} />
              </a>
            </li>
          </ul>

          <p class="mt-5 text-sm md:text-base font-accent">© {year} wadackel.me</p>
        </div>
      </div>
    </footer>
  );
};
