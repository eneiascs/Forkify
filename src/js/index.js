import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';

/**Global state of the app
 * - Search object
 * - Current recipe object
 * - Liked recipes
 */
const state = {};
/**
 * Search Controller
 */

 const controlSearch = async () =>{
    // 1) Get query from view
 
    const query = searchView.getInput();

    if(query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        
        searchView.clearInput();
        searchView.clearResults();
 
        renderLoader(elements.searchResult);
      
        try{
            // 4) Search for recipes
            await state.search.getResults();
        
            clearLoader();
            // 5) Render results on UI
            searchView.renderResults(state.search.result);
        }catch(error){
            clearLoader();
            alert('Something went wrong...');
        }
    } 
}


elements.searchForm.addEventListener('submit', e =>{
   e.preventDefault();
   controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline');
   
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * Recipe controller
 */
const controlRecipe = async ()=>{
    const id = window.location.hash.replace('#', '');
    if(id){
        //Prepare UI for changes
        renderLoader(elements.recipe);
        recipeView.clearRecipe();
        
        
        //Create new recipe object
        searchView.highlightSelected(id);
        
        state.recipe = new Recipe(id);

       

        // Get recipe data
        
        try{
            await state.recipe.getRecipe();
            // Calculate serving and time
            state.recipe.calcTime();
           state.recipe.calcServings();
            state.recipe.parseIngredients();
            //Render recipe
            if(!state.likes) state.likes = new Likes();
             
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        }catch(error){
            console.log(error);
            alert('Error processing recipe')
        }    
        

    }
}

/**
 * List Controller
 */

 const controlList = () => {
     // Create new list IF there is none yet
    if(!state.list) state.list = new List();

    //Add each ingredient to list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });

 }
 

 elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }    
 });


/**
 * Likes controller
 */

 window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => likesView.renderLike(like));
 });

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    if (state.likes.isLiked(currentId)){
        //Remove like from the state
        state.likes.deleteLike(currentId);
        //Toggle like button
        likesView.toggleLikeButton(false);
        //Remove Like from the UI
        likesView.deleteLike(currentId);

    }else{

        //Add like the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle like button
        likesView.toggleLikeButton(true);
        //Add like to the UI
        likesView.renderLike(newLike);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());


}


 ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


elements.recipe.addEventListener('click', e => {
    
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }    
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        recipeView.updateServingsIngredients(state.recipe);    
        state.recipe.updateServings('inc');
    }else if(e.target.matches('.recipe__btn-add, .recipe__btn-add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});

