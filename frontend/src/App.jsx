import UploadPanel from "./components/UploadPanel";
import ScoreCard from "./components/ScoreCard";

function App(){
  return(
    <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",height:"100vh"}}>

      <div>
        <UploadPanel/>
        <ScoreCard/>
      </div>

      <div>
        <h3>Chatbot Area</h3>
      </div>

    </div>
  );
}

export default App;
