/* Css */
import './Header.css'

export default function Header() {
    let showingMenu = false;

    const updateMenu = () => {
        const menu = document.querySelector('.SideMenu');
        const input = document.querySelector('.InputMenuController');
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
        input.checked = showingMenu;
        showingMenu = !showingMenu
    }

    return (
        <header className='flex h v'>
            <label htmlFor="MenuController" className="MenuController" onMouseUp={updateMenu}>
                <input id="MenuController" type="checkbox" className='InputMenuController' />
                <span className='MenuControllerSpan'></span>
                <span className='MenuControllerSpan'></span>
                <span className='MenuControllerSpan'></span>
            </label>

            <img src="/logos/Small-Logo-Dark.png" alt="Small Logo LabHub" />
        </header>
    )
}