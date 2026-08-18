import * as React from "react"
import { Link } from "@inertiajs/react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

/**
 * Pengganti daisyUI `<div className="breadcrumbs">…`.
 * Pakai: <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Network' }]} />
 * Item terakhir otomatis jadi halaman aktif (tanpa link). Item tanpa `href` = teks biasa.
 */
function Breadcrumbs({ items = [], className }) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <React.Fragment key={i}>
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default Breadcrumbs
