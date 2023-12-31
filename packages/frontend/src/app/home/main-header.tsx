import Link from 'next/link'
import StickyHeader, {
  ContributeBtn,
  SubscribeBtn,
  AboutUsBtn,
} from '@/app/components/header'
import HomeTopDetector from './home-top-detector'
import { Navigation } from '@/app/components/navigation'
import { SearchIcon } from '@/app/icons'
import './main-header.scss'

export const MainHeader = () => {
  const searchInput = (
    <form role="search" method="get" action="/search" aria-haspopup="listbox">
      <input
        type="text"
        placeholder="搜尋更多新聞、議題"
        name="q"
        title="Search for..."
        aria-label="Search for..."
      />
      <button type="submit" className="search-submit" aria-label="搜尋按鈕">
        {SearchIcon}
      </button>
    </form>
  )

  return (
    <>
      <div className="main-header-mobile">
        <StickyHeader />
      </div>
      <div>
        <div className="main-header">
          <div className="left">
            <img src="/assets/images/navbar_pic.svg" width="291" />
          </div>
          <div className="center">
            <Link href="/">
              <img
                src="/assets/images/logo-full.svg"
                alt="少年報導者 The Reporter for Kids"
              />
            </Link>
            <Navigation />
          </div>
          <div className="right">
            <div className="content">
              {searchInput}
              <div className="btn-group">
                {ContributeBtn}
                {SubscribeBtn}
                {AboutUsBtn}
              </div>
            </div>
          </div>
          <HomeTopDetector />
        </div>
      </div>
    </>
  )
}

export default MainHeader
