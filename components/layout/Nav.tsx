import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NotificationBell } from './NotificationBell'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: { role: string | null; org_name: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, org_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <nav
      className="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
        <button className="nav-item nav-link px-0 me-xl-6 border-0 bg-transparent" type="button">
          <i className="bx bx-menu bx-md" />
        </button>
      </div>

      <div className="navbar-nav-right d-flex align-items-center justify-content-between w-100" id="navbar-collapse">
        <div className="navbar-nav align-items-center">
          <div className="nav-item d-flex align-items-center">
            <i className="bx bx-search bx-md" />
            <span className="form-control border-0 shadow-none ps-1 ps-sm-2 text-muted">Search marketplace</span>
          </div>
        </div>

        <ul className="navbar-nav flex-row align-items-center ms-auto">
          <li className="nav-item me-2">
            <Link href="/market" className="btn btn-sm btn-primary">
              <i className="bx bx-line-chart me-1" />
              Market
            </Link>
          </li>

          {user && (
            <li className="nav-item me-1">
              <NotificationBell mode={profile?.role === 'buyer' ? 'buyer' : 'seller'} />
            </li>
          )}

          {user ? (
            <li className="nav-item navbar-dropdown dropdown-user dropdown">
              <button className="nav-link dropdown-toggle hide-arrow p-0 border-0 bg-transparent" type="button" data-bs-toggle="dropdown">
                <div className="avatar avatar-online">
                  <span className="avatar-initial rounded-circle bg-label-primary">
                    {profile?.org_name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" href="/profile">
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar avatar-online">
                          <span className="avatar-initial rounded-circle bg-label-primary">
                            {profile?.org_name?.[0]?.toUpperCase() ?? 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="mb-0 text-truncate">{profile?.org_name ?? 'Account'}</h6>
                        <small className="text-muted text-capitalize">{profile?.role ?? 'user'}</small>
                      </div>
                    </div>
                  </Link>
                </li>
                <li><div className="dropdown-divider my-1" /></li>
                <li>
                  <Link className="dropdown-item" href="/profile">
                    <i className="bx bx-user bx-md me-3" />
                    Profile
                  </Link>
                </li>
                <li>
                  <form action="/auth/signout" method="POST">
                    <button className="dropdown-item">
                      <i className="bx bx-power-off bx-md me-3" />
                      Log Out
                    </button>
                  </form>
                </li>
              </ul>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link href="/login" className="btn btn-sm btn-outline-secondary me-2">Log In</Link>
              </li>
              <li className="nav-item">
                <Link href="/register" className="btn btn-sm btn-primary">Join Exchange</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}
