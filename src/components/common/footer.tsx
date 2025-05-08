//import { ORIGIN_URL } from '@/utils/constants';
import { ORIGIN_URL } from '@/utils/helpers';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const footerSections = [
    {
      title: 'About',
      links: [
        {
          href: 'mailto:me@kulkarniankita.com',
          text: 'Contact'
        }
      ]
    },
    {
      title: 'By the Maker of this Site',
      links: [
        {
          text: 'Proofy Bubble',
          href: `https://proofybubble.com?ref=${ORIGIN_URL}`
        },
        {
          text: 'Rave Reviews',
          href: `https://ravereviews.vercel.app?ref=${ORIGIN_URL}`
        },
        {
          text: 'Speakeasy AI',
          href: `https://speakeasyai.dev?ref=${ORIGIN_URL}`
        }
      ]
    },
    {
      title: 'Products',
      links: [
        {
          text: 'Build Modern Full-Stack Apps: Next.js Course',
          href: `https://nextjscourse.dev/?ref=${ORIGIN_URL}`
        },
        {
          text: 'Next.js Workshop',
          href: `https://nextjsworkshop.dev?ref=${ORIGIN_URL}`
        },
        {
          text: 'Developer to Leader',
          href: `https://developertoleader.com?ref=${ORIGIN_URL}`
        },
        {
          text: "Engineering Leader's Playbook",
          href: `https://kulkarniankita.gumroad.com/l/growthfor90days?ref=${ORIGIN_URL}`
        }
      ]
    },
    {
      title: 'Resources',
      links: [
        {
          text: 'Blog',
          href: `https://kulkarniankita.com/blog?ref=${ORIGIN_URL}`
        },
        {
          text: 'Frontend Snacks Newsletter',
          href: `https://frontendsnacks.dev?ref=${ORIGIN_URL}`
        },
        {
          text: "Engineering Leader's Snacks Newsletter",
          href: `https://www.engineeringleadershipsnacks.dev/?ref=${ORIGIN_URL}`
        },
        {
          text: 'Free Course:Next.js Hot Tips',
          href: `https://nextjsworkshop.dev/hot-tips?ref=${ORIGIN_URL}`
        },
        {
          text: 'Personal Website',
          href: `https://kulkarniankita.com/?ref=${ORIGIN_URL}`
        },
        {
          text: 'Frontend Snacks Newsletter',
          href: `https://www.frontendsnacks.dev/?ref=${ORIGIN_URL}`
        }
      ]
    }
  ];
  return (
    <footer
      className={`bg-gray-200/20 sm:p-2 px-6 md:px-12 md:py-12 lg:px-24 py-4 w-full mt-auto`}
    >
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-6 md:mb-0 flex flex-col items-center font-logo text-3xl pt-4 text-black dark:text-white  outline-none mr-auto space-x-4 space-y-4">
          <Image
            src="/images/me-about.png"
            width="120"
            height="120"
            alt="ankita kulkarni picture"
            className="rounded-full w-16 lg:w-24 border-solid border-2 border-gray-300 border-opacity-30 p-0.5 shadow-2xl self-center"
          />
          <div className="mb-6 md:mb-0">
            <a
              href="https://twitter.com/kulkarniankita9"
              target={'_blank'}
              className="flex font-logo text-base lg:text-lg text-gray-400 outline-none mr-auto"
              rel="noreferrer"
            >
              Made by{' '}
              <span className="px-1 underline underline-offset-4">Ankita</span>
              🧡
            </a>
          </div>
        </div>
        <div className="flex gap-4 lg:gap-16 mb-8 flex-col md:flex-row">
          <div>
            <h4 className="mb-2 font-bold text-gray-600 uppercase dark:text-white">
              About
            </h4>
            <ul className="text-gray-600 dark:text-gray-500 list-none">
              {footerSections[0].links.map((linkCol, idx) => {
                return (
                  <li className="mb-1" key={`${idx}-${linkCol.text}`}>
                    <a
                      href={linkCol.href}
                      className="hover:underline dark:text-gray-400"
                    >
                      {linkCol.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-gray-600 uppercase dark:text-white">
              Products
            </h4>
            <ul className="text-gray-600 dark:text-gray-500 list-none">
              {footerSections[1].links.map((linkCol, idx) => {
                return (
                  <li className="mb-1" key={`${idx}-${linkCol.text}`}>
                    <a
                      href={linkCol.href}
                      className="hover:underline dark:text-gray-400"
                    >
                      {linkCol.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-gray-600 uppercase dark:text-white">
              Resources
            </h4>
            <ul className="text-gray-600 dark:text-gray-400 list-none">
              {footerSections[2].links.map((linkCol, idx) => {
                return (
                  <li className="mb-1" key={`${idx}-${linkCol.text}`}>
                    <a
                      href={linkCol.href}
                      className="hover:underline dark:text-gray-400"
                    >
                      {linkCol.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-2 lg:flex lg:items-center lg:justify-between">
        <span className="text-sm text-gray-700 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{' '}
          <Link href="/" className="hover:underline dark:text-gray-400">
            Ankita Kulkarni
          </Link>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
