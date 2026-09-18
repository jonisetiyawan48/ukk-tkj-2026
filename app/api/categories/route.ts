import {NextResponse} from 'next/server'; import {listCategories} from '../../../lib/catalog'; export async function GET(){return NextResponse.json(await listCategories())}
