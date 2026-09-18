export type Product = { id:number; categoryId:number; categoryName:string; name:string; description:string; image:string; price:number; unit:string; stock:number; active:number; createdAt:string };
export type Category = { id:number; name:string; description:string; productCount:number };
