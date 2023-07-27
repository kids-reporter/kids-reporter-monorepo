import './footer.scss'
import '../assets/css/button.css'

const socialIcons = [
  {
    link: 'https://www.facebook.com/twreporter/',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {' '}
        <g clipPath="url(#clip0_1831_1593)">
          {' '}
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>{' '}
          <path
            d="M14.0001 1.10926e-05C10.4743 -0.00442468 7.07662 1.32164 4.48598 3.71325C1.89534 6.10487 0.302483 9.38591 0.0256641 12.9008C-0.251155 16.4157 0.80845 19.9057 2.99277 22.6733C5.17709 25.441 8.32526 27.2826 11.8083 27.8301V18.0493H8.2576V14H11.8138V10.9151C11.8138 7.40823 13.9014 5.4685 17.1014 5.4685C18.1515 5.48299 19.199 5.57456 20.2357 5.74248V9.18905H18.4713C16.7288 9.18905 16.1864 10.2849 16.1864 11.3808V14.0055H20.0713L19.4521 18.0493H16.1644V27.8301C19.6451 27.283 22.7915 25.4435 24.9757 22.6787C27.1599 19.914 28.2213 16.4273 27.9481 12.9145C27.6749 9.40167 26.0872 6.12103 23.5018 3.72723C20.9164 1.33342 17.5235 0.00248567 14.0001 1.10926e-05Z"
            fill="#232323"
          ></path>{' '}
        </g>{' '}
        <defs>
          {' '}
          <clipPath id="clip0_1831_1593">
            {' '}
            <rect width="28" height="28" fill="white"></rect>{' '}
          </clipPath>{' '}
        </defs>{' '}
      </svg>
    ),
  },
  {
    link: 'https://www.instagram.com/twreporter/',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1831_1596)">
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>
          <path
            d="M13.9995 16.937C15.6215 16.937 16.9365 15.622 16.9365 14C16.9365 12.3779 15.6215 11.063 13.9995 11.063C12.3774 11.063 11.0625 12.3779 11.0625 14C11.0625 15.622 12.3774 16.937 13.9995 16.937Z"
            fill="#232323"
          ></path>
          <path
            d="M20.8717 8.79997C20.7297 8.41784 20.5052 8.07172 20.2142 7.78627C19.9236 7.48965 19.5695 7.26293 19.1785 7.12325C18.6519 6.92927 18.0959 6.82733 17.5347 6.82188C16.6087 6.77805 16.3292 6.76709 13.9731 6.76709C11.6169 6.76709 11.3429 6.76709 10.4114 6.82188C9.85024 6.82733 9.29419 6.92927 8.76758 7.12325C8.39497 7.26897 8.05655 7.49025 7.77364 7.77316C7.49074 8.05606 7.26946 8.39448 7.12374 8.76709C6.92976 9.2937 6.82782 9.84975 6.82237 10.4109C6.77854 11.3424 6.76758 11.6219 6.76758 13.9726C6.76758 16.3233 6.76758 16.6082 6.82237 17.5342C6.82782 18.0954 6.92976 18.6514 7.12374 19.1781C7.26475 19.5607 7.48939 19.907 7.78128 20.1917C8.06673 20.4828 8.41285 20.7073 8.79497 20.8493C9.32105 21.0459 9.87724 21.1497 10.4388 21.1561C11.3703 21.1945 11.6498 21.2054 14.0005 21.2054C16.3511 21.2054 16.6361 21.2054 17.5621 21.1561C18.1237 21.1497 18.6799 21.0459 19.2059 20.8493C19.5853 20.7031 19.9296 20.4788 20.2166 20.1908C20.5035 19.9029 20.7267 19.5578 20.8717 19.1781C21.0683 18.652 21.1721 18.0958 21.1785 17.5342C21.2169 16.6082 21.2279 16.3287 21.2279 13.9726C21.2279 11.6164 21.2279 11.3424 21.1785 10.4109C21.1683 9.86042 21.0646 9.31567 20.8717 8.79997ZM14.0005 18.526C13.1053 18.526 12.2302 18.2605 11.4859 17.7632C10.7416 17.2659 10.1615 16.559 9.81895 15.732C9.47639 14.905 9.38676 13.9949 9.56139 13.117C9.73603 12.239 10.1671 11.4326 10.8001 10.7996C11.433 10.1666 12.2395 9.73554 13.1175 9.56091C13.9954 9.38627 14.9055 9.4759 15.7325 9.81846C16.5595 10.161 17.2664 10.7411 17.7637 11.4854C18.261 12.2297 18.5265 13.1048 18.5265 14C18.5265 15.2003 18.0496 16.3516 17.2008 17.2004C16.352 18.0491 15.2008 18.526 14.0005 18.526ZM18.7073 10.3507C18.4972 10.3506 18.2919 10.288 18.1176 10.1708C17.9432 10.0536 17.8077 9.88711 17.7283 9.69259C17.649 9.49807 17.6294 9.28433 17.672 9.07861C17.7146 8.87289 17.8175 8.68453 17.9676 8.53754C18.1177 8.39055 18.3082 8.2916 18.5148 8.2533C18.7213 8.21501 18.9346 8.2391 19.1274 8.32251C19.3202 8.40593 19.4838 8.54488 19.5974 8.72165C19.7109 8.89842 19.7692 9.105 19.7648 9.31504C19.7605 9.59215 19.647 9.85636 19.449 10.0503C19.251 10.2442 18.9844 10.3521 18.7073 10.3507Z"
            fill="#232323"
          ></path>
          <path
            d="M14 0C11.2311 0 8.52431 0.821086 6.22202 2.35943C3.91973 3.89777 2.12532 6.08427 1.06569 8.64243C0.00606596 11.2006 -0.271181 14.0155 0.269012 16.7313C0.809205 19.447 2.14258 21.9416 4.10051 23.8995C6.05845 25.8574 8.55301 27.1908 11.2687 27.731C13.9845 28.2712 16.7994 27.9939 19.3576 26.9343C21.9157 25.8747 24.1022 24.0803 25.6406 21.778C27.1789 19.4757 28 16.7689 28 14C28 10.287 26.525 6.72601 23.8995 4.1005C21.274 1.475 17.713 0 14 0V0ZM22.7671 17.6329C22.7529 18.3652 22.6139 19.0897 22.3562 19.7753C22.1316 20.3613 21.7863 20.8934 21.3426 21.3371C20.8989 21.7808 20.3668 22.1262 19.7808 22.3507C19.0952 22.6084 18.3707 22.7474 17.6384 22.7616C16.7014 22.8055 16.4 22.8164 14.0055 22.8164C11.611 22.8164 11.3096 22.8164 10.3726 22.7616C9.63672 22.7475 8.90857 22.6085 8.21918 22.3507C7.63206 22.1285 7.0995 21.7828 6.65754 21.337C6.21091 20.8957 5.8651 20.3629 5.64384 19.7753C5.38609 19.0897 5.24711 18.3652 5.23288 17.6329C5.18905 16.6959 5.17809 16.3945 5.17809 14C5.17809 11.6055 5.17809 11.3041 5.23288 10.3671C5.24941 9.63276 5.39021 8.90651 5.64932 8.21918C5.87385 7.63323 6.21919 7.10111 6.66289 6.6574C7.10659 6.2137 7.63872 5.86836 8.22466 5.64384C8.91059 5.38721 9.63493 5.24827 10.3671 5.23288C11.3041 5.18904 11.6055 5.17808 14 5.17808C16.3945 5.17808 16.6959 5.17808 17.6329 5.23288C18.3652 5.2471 19.0897 5.38608 19.7753 5.64384C20.3629 5.86509 20.8957 6.21091 21.337 6.65753C21.7828 7.09949 22.1285 7.63205 22.3507 8.21918C22.6073 8.9051 22.7463 9.62945 22.7617 10.3616C22.8055 11.2986 22.8164 11.6 22.8164 13.9945C22.8164 16.389 22.8055 16.6959 22.7617 17.6329H22.7671Z"
            fill="#232323"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_1831_1596">
            <rect width="28" height="28" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    link: 'https://twitter.com/tw_reporter_org',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1831_1601)">
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14 0C11.2311 0 8.52431 0.821086 6.22202 2.35943C3.91973 3.89777 2.12532 6.08427 1.06569 8.64243C0.00606596 11.2006 -0.271181 14.0155 0.269012 16.7313C0.809205 19.447 2.14258 21.9416 4.10051 23.8995C6.05845 25.8574 8.55301 27.1908 11.2687 27.731C13.9845 28.2712 16.7994 27.9939 19.3576 26.9343C21.9157 25.8747 24.1022 24.0803 25.6406 21.778C27.1789 19.4757 28 16.7689 28 14C28 10.287 26.525 6.72601 23.8995 4.1005C21.274 1.475 17.713 0 14 0V0ZM21.737 11.0082C21.737 11.1671 21.737 11.326 21.737 11.4849C21.737 16.4164 18 22.0658 11.1617 22.0658C9.1468 22.0631 7.17491 21.4831 5.47946 20.3945C5.77419 20.4276 6.07055 20.4441 6.36713 20.4438C8.03241 20.4429 9.64925 19.8834 10.9589 18.8548C10.1868 18.8361 9.43966 18.5776 8.8211 18.1152C8.20254 17.6527 7.74322 17.0092 7.50686 16.274C8.06347 16.38 8.63696 16.3575 9.18357 16.2082C8.34183 16.0396 7.58463 15.5842 7.04107 14.9197C6.49751 14.2553 6.20123 13.4229 6.20275 12.5644V12.5151C6.71746 12.8043 7.29475 12.9641 7.88494 12.9808C7.09746 12.4551 6.54004 11.6489 6.32624 10.7266C6.11244 9.80418 6.25836 8.83498 6.73425 8.01644C7.66837 9.16643 8.83427 10.1067 10.156 10.7761C11.4778 11.4455 12.9257 11.8289 14.4055 11.9014C14.3436 11.6244 14.3123 11.3414 14.3123 11.0575C14.3121 10.3116 14.5361 9.58281 14.9552 8.96576C15.3743 8.34871 15.9693 7.8719 16.6628 7.59721C17.3563 7.32252 18.1164 7.26263 18.8444 7.42533C19.5724 7.58803 20.2346 7.96579 20.7452 8.50959C21.5773 8.34473 22.3757 8.04094 23.1069 7.61096C22.8253 8.47206 22.2413 9.20201 21.463 9.66575C22.2007 9.57873 22.9212 9.38108 23.6 9.07945C23.0986 9.82801 22.4677 10.4812 21.737 11.0082Z"
            fill="#232323"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_1831_1601">
            <rect width="28" height="28" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    link: 'https://medium.com/twreporter',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1831_1604)">
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>
          <path
            d="M14 0C11.2311 0 8.52431 0.821086 6.22202 2.35943C3.91973 3.89777 2.12532 6.08427 1.06569 8.64243C0.00606596 11.2006 -0.271181 14.0155 0.269012 16.7313C0.809205 19.447 2.14258 21.9416 4.10051 23.8995C6.05844 25.8574 8.55301 27.1908 11.2687 27.731C13.9845 28.2712 16.7994 27.9939 19.3576 26.9343C21.9157 25.8747 24.1022 24.0803 25.6406 21.778C27.1789 19.4757 28 16.7689 28 14C28 10.287 26.525 6.72601 23.8995 4.1005C21.274 1.475 17.713 0 14 0V0ZM14.9863 14.7507C14.9251 15.1689 14.8167 15.5788 14.663 15.9726C14.1449 17.275 13.138 18.3231 11.8575 18.8932C11.2302 19.1707 10.5543 19.3215 9.8685 19.337C9.3354 19.354 8.80293 19.2874 8.29042 19.1397C7.56799 18.9326 6.89884 18.5719 6.32877 18.0822C5.78007 17.6219 5.32984 17.0556 5.00503 16.4173C4.68021 15.7789 4.48748 15.0817 4.43836 14.3671C4.40829 13.9332 4.43037 13.4972 4.50412 13.0685C4.63229 12.3411 4.90977 11.6481 5.31906 11.0332C5.72835 10.4183 6.26058 9.89487 6.8822 9.49589C7.62853 9.01163 8.48735 8.72851 9.37535 8.67397H9.55069H9.95069H10.2082C10.5123 8.69711 10.8133 8.75034 11.1069 8.83288C12.3575 9.18342 13.4392 9.97452 14.1522 11.0602C14.8652 12.1458 15.1615 13.4527 14.9863 14.7397V14.7507ZM20.8219 14.537C20.8219 14.7836 20.7836 15.0356 20.7507 15.2822C20.6525 16.1109 20.3997 16.9138 20.0055 17.6493C19.835 17.9704 19.6149 18.2626 19.3534 18.5151C19.1236 18.739 18.8409 18.9011 18.5315 18.9863C18.1951 19.0614 17.8431 19.0188 17.5342 18.8658C17.2577 18.7187 17.0136 18.5174 16.8164 18.274C16.5225 17.9143 16.2859 17.5114 16.1151 17.0795C15.9198 16.5903 15.7783 16.0814 15.6932 15.5616C15.5972 14.9988 15.5532 14.4284 15.5616 13.8575C15.5626 13.4909 15.5882 13.1248 15.6384 12.7616C15.7071 12.2217 15.8339 11.6908 16.0164 11.1781C16.1705 10.7247 16.3902 10.2965 16.6685 9.90685C16.852 9.64757 17.0802 9.42306 17.3425 9.24384C17.5628 9.09504 17.8173 9.00454 18.0822 8.98082C18.3603 8.95582 18.6399 9.01096 18.8877 9.13973C19.156 9.2758 19.3959 9.46177 19.5945 9.68767C19.9124 10.0747 20.1642 10.5117 20.3397 10.9808C20.5228 11.4493 20.6551 11.9361 20.7342 12.4329C20.8147 12.9054 20.8569 13.3837 20.8603 13.863V13.9452C20.8548 14.1589 20.8548 14.3452 20.8219 14.537ZM23.2164 14.4V14.4384C23.2164 14.8548 23.1781 15.2712 23.1507 15.6877C23.1081 16.2856 23.0183 16.8792 22.8822 17.463C22.8229 17.7103 22.7385 17.9508 22.6301 18.1808C22.5846 18.2775 22.5214 18.3648 22.4438 18.4384C22.4229 18.4601 22.3978 18.4773 22.37 18.4891C22.3422 18.5009 22.3124 18.507 22.2822 18.507C22.252 18.507 22.2222 18.5009 22.1944 18.4891C22.1666 18.4773 22.1415 18.4601 22.1205 18.4384C22.0278 18.3562 21.9564 18.2528 21.9123 18.137C21.8005 17.8875 21.716 17.6266 21.6603 17.3589C21.5764 16.981 21.5142 16.5987 21.474 16.2137C21.3978 15.5132 21.3631 14.8087 21.3699 14.1041C21.3699 13.7096 21.3699 13.3151 21.3699 12.9205C21.3915 12.2134 21.474 11.5094 21.6164 10.8164C21.6761 10.4871 21.7773 10.1668 21.9178 9.86301C21.9615 9.75557 22.0247 9.65712 22.1041 9.5726C22.1261 9.54416 22.1544 9.52114 22.1867 9.5053C22.219 9.48947 22.2544 9.48123 22.2904 9.48123C22.3264 9.48123 22.3619 9.48947 22.3942 9.5053C22.4265 9.52114 22.4547 9.54416 22.4767 9.5726C22.5743 9.6765 22.6489 9.7997 22.6959 9.93425C22.8062 10.2066 22.8888 10.4893 22.9425 10.7781C23.0314 11.1997 23.0972 11.626 23.1397 12.0548C23.2 12.6521 23.2274 13.2548 23.2329 13.8575V14.4055L23.2164 14.4Z"
            fill="#232323"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_1831_1604">
            <rect width="28" height="28" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    link: 'https://github.com/twreporter',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1831_1607)">
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>
          <path
            d="M14.0002 -5.61702e-05C10.5662 -0.00202214 7.25116 1.25824 4.68569 3.54104C2.12023 5.82385 0.483265 8.96994 0.0861461 12.381C-0.310973 15.792 0.559453 19.23 2.53188 22.0411C4.5043 24.8522 7.44113 26.8403 10.7838 27.6273C10.7838 26.1862 10.7838 23.9616 10.7838 23.4082V23.3369H10.718C10.3256 23.4108 9.92811 23.4547 9.529 23.4684C8.99098 23.4984 8.45209 23.4278 7.93996 23.2602C7.61017 23.1609 7.30694 22.9887 7.05274 22.7563C6.79854 22.5239 6.59987 22.2373 6.47147 21.9178C6.2612 21.4077 5.98287 20.9285 5.64407 20.4931C5.47435 20.2707 5.26199 20.0845 5.01941 19.9452C4.92794 19.8982 4.84317 19.8393 4.76736 19.7698C4.66306 19.6965 4.57839 19.5986 4.52078 19.4849C4.50695 19.4628 4.49821 19.4379 4.49519 19.412C4.49218 19.3862 4.49498 19.3599 4.50337 19.3353C4.51177 19.3106 4.52556 19.2881 4.54374 19.2694C4.56191 19.2508 4.58402 19.2364 4.60846 19.2273C4.65758 19.2052 4.70905 19.1887 4.76188 19.178C5.20012 19.0865 5.65677 19.1712 6.03311 19.4136C6.47859 19.6888 6.85381 20.0641 7.129 20.5095C7.23699 20.6876 7.3598 20.8562 7.49613 21.0136C7.69961 21.2582 7.94978 21.4597 8.23202 21.6065C8.51426 21.7532 8.82292 21.8423 9.13996 21.8684C9.71454 21.9081 10.2897 21.8006 10.8112 21.5561C10.8327 21.5421 10.8484 21.5206 10.855 21.4958C10.8879 21.3369 10.9153 21.1726 10.9591 21.0191C11.0703 20.5691 11.308 20.1603 11.6441 19.841L11.0359 19.726C10.4575 19.6423 9.88865 19.5029 9.33722 19.3095C8.66128 19.0677 8.03945 18.6953 7.50709 18.2136C6.89214 17.6408 6.43381 16.9203 6.17558 16.1205C5.91799 15.307 5.78678 14.4587 5.78654 13.6054C5.77208 13.0508 5.83853 12.497 5.9838 11.9616C6.19666 11.2384 6.57143 10.5732 7.07969 10.0164C7.07969 9.98899 7.129 9.96707 7.11256 9.91775C6.98887 9.58091 6.91145 9.22884 6.88243 8.87118C6.81737 8.08993 6.93363 7.30421 7.22215 6.57529C7.22215 6.57529 7.26051 6.52597 7.28243 6.52597C7.44114 6.51502 7.60042 6.51502 7.75914 6.52597C8.17691 6.57467 8.58506 6.68548 8.9701 6.85474C9.58872 7.11916 10.1797 7.44403 10.7345 7.8246C10.7523 7.83374 10.772 7.8385 10.792 7.8385C10.812 7.8385 10.8317 7.83374 10.8496 7.8246C11.6778 7.59688 12.5286 7.46091 13.3865 7.41912C14.0427 7.38534 14.7004 7.40366 15.3537 7.47392C15.968 7.54235 16.5762 7.65775 17.1728 7.81912C17.1941 7.82974 17.2176 7.83526 17.2413 7.83526C17.2651 7.83526 17.2886 7.82974 17.3098 7.81912C17.655 7.60542 18.0002 7.38625 18.3619 7.18899C18.873 6.89325 19.4279 6.68056 20.0057 6.55885C20.2481 6.50219 20.4985 6.4892 20.7454 6.52049C20.7613 6.524 20.7762 6.53067 20.7894 6.54008C20.8026 6.54949 20.8137 6.56147 20.8222 6.57529C21.0225 7.08332 21.1426 7.6194 21.1783 8.16433C21.2206 8.73995 21.1441 9.31811 20.9537 9.86296C20.9423 9.88964 20.9394 9.91915 20.9453 9.94755C20.9511 9.97594 20.9655 10.0019 20.9865 10.0219C21.7797 10.9028 22.2256 12.042 22.2413 13.2273C22.2413 13.6054 22.2413 13.989 22.203 14.3725C22.1642 14.9462 22.0556 15.5129 21.8797 16.0602C21.6891 16.6923 21.3704 17.2783 20.9433 17.7817C20.5162 18.2852 19.99 18.6952 19.3975 18.9862C18.5617 19.3759 17.6676 19.6258 16.7509 19.726L16.3674 19.7753L16.4002 19.8136C16.5676 19.9714 16.7066 20.1567 16.8112 20.3616C17.0895 20.8642 17.2311 21.431 17.2222 22.0054C17.2222 22.8821 17.2222 26.3068 17.2222 27.6493C20.5872 26.8821 23.5502 24.8989 25.5424 22.0806C27.5346 19.2622 28.4156 15.8073 28.0161 12.3791C27.6166 8.9509 25.9649 5.7911 23.378 3.50632C20.7912 1.22155 17.4515 -0.027159 14.0002 -5.61702e-05Z"
            fill="#232323"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_1831_1607">
            <rect width="28" height="28" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
    ),
  },
  {
    link: 'https://kids.twreporter.org/feed/',
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1831_1610)">
          <path
            d="M28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14Z"
            fill="white"
          ></path>
          <path
            d="M14 0C11.2311 0 8.52431 0.821086 6.22202 2.35943C3.91973 3.89777 2.12532 6.08427 1.06569 8.64243C0.00606596 11.2006 -0.271181 14.0155 0.269012 16.7313C0.809205 19.447 2.14258 21.9416 4.10051 23.8995C6.05845 25.8574 8.55301 27.1908 11.2687 27.731C13.9845 28.2712 16.7994 27.9939 19.3576 26.9343C21.9157 25.8747 24.1022 24.0803 25.6406 21.778C27.1789 19.4757 28 16.7689 28 14C28 10.287 26.525 6.72601 23.8995 4.1005C21.274 1.475 17.713 0 14 0V0ZM10.7726 20.5425C10.4051 20.882 9.945 21.1048 9.45069 21.1825C8.95639 21.2602 8.45014 21.1894 7.99616 20.9789C7.54218 20.7685 7.16092 20.428 6.90073 20.0006C6.64054 19.5732 6.51316 19.0781 6.53472 18.5782C6.55629 18.0783 6.72584 17.5961 7.02187 17.1927C7.31791 16.7893 7.72708 16.4829 8.19749 16.3123C8.66791 16.1418 9.17838 16.1148 9.66415 16.2348C10.1499 16.3548 10.5891 16.6163 10.926 16.9863C11.3723 17.4806 11.6063 18.1305 11.5776 18.7958C11.5489 19.4611 11.2598 20.0885 10.7726 20.5425ZM17.5781 19.9014C17.5109 20.2678 17.315 20.5981 17.0257 20.8327C16.7364 21.0674 16.3728 21.1909 16.0004 21.1809C15.6281 21.171 15.2715 21.0283 14.9951 20.7786C14.7187 20.5289 14.5407 20.1886 14.4932 19.8192C14.4548 19.3644 14.4932 18.9096 14.4548 18.4493C14.4348 17.7485 14.2656 17.0601 13.9585 16.4299C13.6515 15.7996 13.2135 15.2421 12.674 14.7945C11.7614 14.0045 10.5933 13.5723 9.38631 13.5781C9.0137 13.5781 8.6411 13.5781 8.29042 13.5781C8.00963 13.5792 7.73363 13.5054 7.49089 13.3642C7.24816 13.2231 7.04747 13.0198 6.90955 12.7752C6.77162 12.5306 6.70145 12.2536 6.70628 11.9729C6.7111 11.6922 6.79075 11.4178 6.93699 11.1781C7.06429 10.9487 7.24988 10.7569 7.47502 10.6222C7.70015 10.4875 7.95686 10.4147 8.21918 10.411C9.40744 10.3463 10.5985 10.4702 11.748 10.7781C13.0809 11.1814 14.2894 11.9167 15.2603 12.9151C16.2866 13.9576 17.0117 15.2583 17.3589 16.6795C17.6253 17.7315 17.6996 18.823 17.5781 19.9014ZM22.8712 19.726C22.8655 20.0568 22.7456 20.3755 22.5319 20.6281C22.3183 20.8807 22.0239 21.0518 21.6986 21.1123C21.38 21.1754 21.0494 21.1263 20.7629 20.9736C20.4763 20.8208 20.2513 20.5736 20.126 20.274C20.0303 20.0337 19.9856 19.7762 19.9945 19.5178C20.0464 18.3912 19.9431 17.2629 19.6877 16.1644C19.1232 13.8255 17.7851 11.7459 15.8904 10.263C14.0018 8.7336 11.6467 7.89638 9.21644 7.89041H8.24658C7.97774 7.90291 7.71074 7.84016 7.4756 7.70922C7.24047 7.57828 7.04653 7.38435 6.91558 7.14921C6.78464 6.91408 6.72189 6.64708 6.73438 6.37824C6.74687 6.1094 6.83412 5.84937 6.98631 5.6274C7.00054 5.60335 7.01159 5.57757 7.01918 5.55068L7.32055 5.25479C7.71866 5.04331 8.17086 4.95554 8.61918 5.00274C10.1982 4.97924 11.7713 5.20106 13.2822 5.66027C15.5019 6.36314 17.5078 7.61585 19.1134 9.30194C20.719 10.988 21.8722 13.0528 22.4658 15.3041C22.8329 16.7475 22.9698 18.2399 22.8712 19.726Z"
            fill="#232323"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_1831_1610">
            <rect width="28" height="28" fill="white"></rect>
          </clipPath>
        </defs>
      </svg>
    ),
  },
]

export const Footer = () => {
  return (
    <>
      <div className="footer">
        <div className="footer-top">
          <div className="footer-top__left">
            <picture className="footer-top__left-logo">
              <img
                src="https://kids.twreporter.org/wp-content/themes/blocksy-child/assets/img/footer-logo.svg"
                alt=""
              />
            </picture>
            <p className="footer-top__left-p">
              《少年報導者》是由非營利媒體《報導者》針對兒少打造的深度新聞報導品牌，與兒童和少年一起理解世界，參與未來。
            </p>
            <div className="footer-top__left-social">
              <div className="footer-top__social-icon-group">
                {socialIcons.map((icon, index) => {
                  return (
                    <a
                      key={`social-icon-${index}`}
                      href={icon.link}
                      className="footer-top__social-icon-item"
                      target="_blank"
                    >
                      {icon.svg}
                    </a>
                  )
                })}
              </div>{' '}
            </div>
          </div>
          <div className="footer-top__middle">
            <div className="footer-top__team-box">
              <a href="/about" className="footer-top__team-box-item">
                <img
                  src="https://kids.twreporter.org/wp-content/uploads/2022/10/footer_pic1.svg"
                  alt="我們是誰"
                />
                我們是誰
              </a>
              <a
                href="/about#team"
                className="footer-top__team-box-item __mPS2id"
              >
                <img
                  src="https://kids.twreporter.org/wp-content/uploads/2022/10/footer_pic2.svg"
                  alt="我們是誰"
                />
                核心團隊
              </a>
              <a
                href="/about#consultor"
                className="footer-top__team-box-item __mPS2id"
              >
                <img
                  src="https://kids.twreporter.org/wp-content/uploads/2022/10/footer_pic3.svg"
                  alt="我們是誰"
                />
                顧問群
              </a>
              <a
                href="/about#mail"
                className="footer-top__team-box-item __mPS2id"
              >
                <img
                  src="https://kids.twreporter.org/wp-content/uploads/2022/10/footer_pic4.svg"
                  alt="我們是誰"
                />
                聯絡我們
              </a>
            </div>
            <div className="footer-top__button-group">
              <a
                href="https://support.twreporter.org/"
                className="header-left__btn-1 rpjr-btn rpjr-btn-big"
                target="_blank"
              >
                贊助我們
              </a>
              <a
                href="http://eepurl.com/idk8VH"
                target="_blank"
                className="header-left__btn-1 rpjr-btn rpjr-btn-orange rpjr-btn-big"
              >
                訂閱我們
              </a>
              <a
                href="https://www.twreporter.org/"
                className="header-left__btn-1 rpjr-btn rpjr-btn-red rpjr-btn-big"
                target="_blank"
              >
                前往報導者
              </a>
            </div>
          </div>
          <div className="footer-top__right">
            <img
              src="https://kids.twreporter.org/wp-content/uploads/2022/10/footer_pic5.svg"
              className="footer-top__fig"
            />
          </div>
        </div>
      </div>

      <div id="footer" className="footer-copyright" data-id="type-1">
        <div className="footer-copyright-container">
          <div data-column="text">
            <div className="ct-header-text " data-id="text">
              <div className="entry-content">
                公益勸募許可字號｜衛部救字第 1101363853 號{' '}
                <a
                  href="https://www.twreporter.org/a/privacy-footer"
                  target="_blank"
                  className="footer-link"
                >
                  <strong>隱私政策</strong>
                </a>{' '}
                <a
                  href="https://www.twreporter.org/a/license-footer"
                  target="_blank"
                  className="footer-link"
                >
                  <strong>許可協議</strong>
                </a>{' '}
              </div>
            </div>
          </div>
          <div data-column="copyright">
            <div className="ct-footer-copyright" data-id="copyright">
              <p>Copyright © 2023 The Reporter</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Footer
