import NavBar from "../components/NavBar";

export default function MainPage() {
    return (
        <div style={{'display': 'flex'}}>
            <NavBar />
            <div style={{'flexGrow':'1', 'textAlign':'center', 'height':'100vh','overflowY':'scroll'}}>
                <p>tesajdkbsauikjdhb</p>
            </div>
        </div>
    );
}