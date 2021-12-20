
import "./css/test.css"
import { App } from "./App";

export let app:App;
window.onload = function(){
    app = new App();
    app.run();
    
}