import AdminLoginForm from '../../../components/AdminLoginForm'; import {labMode} from '../../../lib/db';
export default function AdminLoginPage(){return <main className="container section" style={{maxWidth:420}}><div className="eyebrow">Ruang Pengelola</div><h2>Masuk admin</h2><AdminLoginForm/>{labMode&&<div className="notice" style={{marginTop:16}}></div>}</main>}
