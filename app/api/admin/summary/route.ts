import {NextResponse} from 'next/server'; import {summary} from '../../../../lib/admin'; export async function GET(){return NextResponse.json(await summary())}
