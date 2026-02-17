// import { Component } from '@angular/core';
// import {Auth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence} from '@angular/fire/auth';
// import { Router } from '@angular/router';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { AccessService } from '../../access-control/access.service';


// @Component({
//   selector: 'app-login',
//   imports: [],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent {

//   constructor(private auth: Auth, private router: Router, private http: HttpClient, private accessService: AccessService) {}


//   async login(){
//     try{
//       await setPersistence(this.auth, browserLocalPersistence);

//       const provider= new GoogleAuthProvider();
//       provider.setCustomParameters({
//         prompt: 'select_account'
//         });
      
//         const result = await signInWithPopup(this.auth, provider);
//         const user = result.user;
//         const token = await user.getIdToken();

//       localStorage.setItem('token', token);

//       const payLoad = {googleId: user.uid, name: user.displayName, email: user.email};
//       const headers = new HttpHeaders( {Authorization: `Bearer ${token}`});
      
//       const resp : any= await this.http.post('http://localhost:3000/api/users/login', {},{headers})
//       .toPromise();

//       if (resp?.orgId) localStorage.setItem('orgId', resp.orgId);
//       if(resp?.role) { localStorage.setItem('role', resp.role);
//       this.accessService.setRole(resp.role);
//       }

//       this.router.navigate(['/home']);
      
//     }
//     catch(err : any){
//       console.error('error logging in', err);
//       if (err?.status===403){
//         alert('אין לך הרשאה להכנס, פנה למנהל לקבלת גישה');
//       }else{
//         alert('שגיאה בהתחברות,נסה שוב.');
//       }

//       localStorage.removeItem('token');
//       localStorage.removeItem('orgId');
//       localStorage.removeItem('role');
//       this.accessService.clearAuth();
//     }
//   }

// }










// //     login(){
    
// //     const provider= new GoogleAuthProvider();
// //     signInWithPopup(this.auth, provider)
// //     .then(async (result) => {
// //       const user = result.user;
// //       const token=await user.getIdToken();
// //       user.getIdToken().then((token) => {
// //         console.log(`התחברת כ : ${user.email}`);
// //         localStorage.setItem('token', token);
// // this.http.post<any>('http://localhost:3000/api/users/login', {googleId: user.uid, name: user.displayName, email: user.email},
// // {headers: {Authorization: `Bearer ${token}`}}
// // ).subscribe({
// //   next: (resp)=>{
// // if (resp?.orgId){
// //   localStorage.setItem('orgId', resp.orgId);
// // }
// // if(resp?.role){
// //   localStorage.setItem('role', resp.role);
// // }
// // console.log('user logged in');
// // this.router.navigate(['/home']);
// //   },
// //   error: (error) => {
// //     console.error('error logging in', error);
// //     alert('אירעה שגיאה בהתחברות, יש לנסות שוב');
// //   }
// // });
// // })
// //       .catch((error)=>{
// //         console.error('error logging in', error);
// //         alert('שגיאה בהתחברות עם google');
// //       });
// //     })
// //     .catch((error) => {
// //       console.error('error logging in', error);
// //       alert('שגיאה בהתחברות עם google');
// //     });
// //   }
// // }
    
  

import { Component, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AccessService } from '../../access-control/access.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private injector = inject(EnvironmentInjector);

  constructor(
    private auth: Auth,
    private router: Router,
    private http: HttpClient,
    private accessService: AccessService
  ) {}

  async login() {
    try {
      await runInInjectionContext(this.injector, async () => {
        await setPersistence(this.auth, browserLocalPersistence);

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        const result = await signInWithPopup(this.auth, provider);
        const user = result.user;
        const token = await user.getIdToken();

        localStorage.setItem('token', token);

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        const resp: any = await this.http
          .post('http://localhost:3000/api/users/login', {}, { headers })
          .toPromise();

        if (resp?.orgId) localStorage.setItem('orgId', resp.orgId);
        if (resp?.role) {
          localStorage.setItem('role', resp.role);
          this.accessService.setRole(resp.role);
        }

        this.router.navigate(['/home']);
      });
    } catch (err: any) {
      console.error('error logging in', err);
      if (err?.status === 403) {
        alert('אין לך הרשאה להכנס, פנה למנהל לקבלת גישה');
      } else {
        alert('שגיאה בהתחברות,נסה שוב.');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('orgId');
      localStorage.removeItem('role');
      this.accessService.clearAuth();
    }
  }
}
