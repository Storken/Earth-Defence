// export class MockServer{
//
//   private valueSubject: Subject<number>;
//   public value : Observable<number>;
//
//   private startedSubject: Subject<boolean>;
//   private started : Observable<boolean>;
//
//   constructor() {
//     this.valueSubject = new Subject<number>();
//     this.startedSubject = new Subject<boolean>();
//     console.log("sub", this.valueSubject);
//     this.value = this.valueSubject.asObservable();
//     this.started = this.startedSubject.asObservable();
//     console.log("val", this.value);
//   }
//
//   public start(name: string) : Observable<boolean> {
//     return this.started;
//   }
//   public notify(){
//   }
// }
