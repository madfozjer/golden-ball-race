import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

async function checkAPI() {
  try {
    const response = await fetch(`http://localhost:5000/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Fetch health is unsuccesful.`, error);
  }
}

async function getData() {
  try {
    const response = await fetch(`http://localhost:5000/api/getdata`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Fetch data is unsuccesful.`, error);
  }
}

const app = createApp(App);

checkAPI();
const data = await getData();
app.config.globalProperties.$data = {
  data: data,
};

app.mount("#app");
