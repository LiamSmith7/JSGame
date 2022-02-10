class LayoutManager {
    constructor(){
        this._layout = [];
    }
    place(x, y, id){
        if(this._layout[x] == null)
            this._layout[x] = [];
        this._layout[x][y] = id;
    }
    placeHorizontal(y, x1, x2, id){
        for(let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++){
            this.place(i, y, id);
        }  
    }
    placeVertical(x, y1, y2, id) {
        for(let i = Math.min(y1, y2); i <= Math.max(y1, y2); i++){
            this.place(x, i, id);
        }
    }
    placeBox(x1, y1, x2, y2, id) {
        for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++){
            for(let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++){
                this.place(x, y, id);
            }
        }
    }
    get layout(){
        return this._layout;
    }
    read(x, y){
        if(this._layout[x])
            return this._layout[x][y];
        return null;
    }
}

export default LayoutManager;