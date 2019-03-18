import axios from 'axios';
import { key } from '../config';
import { mockRecipes } from './Mock';
export default class Search {
    constructor(query, page = 1, sort = 'r'){
        this.query = query;
        this.page = page;
        this.sort = sort;
    }; 
    async getResults(){
        
        try{
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}&page=${this.page}&sort=${this.sort}`);
            this.result = res.data.recipes;
            
            //this.result = mockRecipes[`page${this.page}`];

            
        
        }catch(error){ 
            console.log(error);
            alert(error);
        }
    };
}

