import {NextResponse} from 'next/server'; import type {NextRequest} from 'next/server';
export function middleware(req:NextRequest){const {pathname}=req.nextUrl;if(pathname==='/admin/login')return NextResponse.next();const session=req.cookies.get('admin_session');if(!session){const url=req.nextUrl.clone();url.pathname='/admin/login';return NextResponse.redirect(url)}return NextResponse.next()}
export const config={matcher:['/admin/:path*']};
