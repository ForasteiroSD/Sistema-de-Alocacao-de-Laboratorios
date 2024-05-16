/* Css */
import './Header.css'

export default function Header() {
    let showingMenu = false;

    const updateMenu = () => {
        const menu = document.querySelector('.SideMenu');
        const spans = document.querySelectorAll('.MenuControllerSpan');
        
        if(!showingMenu) {
            menu.style.transition = 'transform .3s';
            menu.style.transform = 'translateX(0)';
            spans.forEach(span => {
                span.style.background = 'var(--background)'
            });
        }
        else {
            menu.style.transform = 'translateX(-100%)';
            spans.forEach(span => {
                span.style.background = 'var(--gray)'
            });
            menu.style.transform = '';
            setTimeout(() => {
                menu.style.transition = 'none';
            }, 300);
        }
        showingMenu = !showingMenu
    }

    return (
        <header className='flex h v'>
            <label htmlFor="MenuController" className="MenuController" onMouseDown={updateMenu}>
                <input id="MenuController" type="checkbox" />
                <span className='MenuControllerSpan'></span>
                <span className='MenuControllerSpan'></span>
                <span className='MenuControllerSpan'></span>
            </label>

            <img src="../../public/logos/Small-Logo-Dark.png" alt="Small Logo LabHub" />
        </header>
    )
}