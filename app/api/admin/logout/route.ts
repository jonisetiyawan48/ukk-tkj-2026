import {NextRequest,NextResponse} from 'next/server';
export async function GET(req:NextRequest){const res=NextResponse.redirect(new URL('/admin/login',req.url));res.cookies.set('admin_session','',{path:'/',maxAge:0});return res}
