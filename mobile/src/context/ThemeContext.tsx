import {
createContext,
useContext
} from "react";

import {
LIGHT_THEME,
DARK_THEME
} from "../constants/colors";

import {useSettings} from "../hooks/useSettings";



export const ThemeContext =
createContext<any>(null);




export function ThemeProvider(
{children}:{
children:React.ReactNode
}

){


const {
darkMode
}=useSettings();



const theme =
darkMode
?
DARK_THEME
:
LIGHT_THEME;



return(

<ThemeContext.Provider

value={{
theme
}}

>

{children}

</ThemeContext.Provider>


);


}