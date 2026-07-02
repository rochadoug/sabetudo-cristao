import logo from '../assets/logo.png';

function Logo({ mclass }: { mclass: string }) {
    return (
        <img src={logo} alt='Logo do SabeTudo'  className={mclass}/>
    )
}
export default Logo;