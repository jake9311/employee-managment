import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Auth} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import {user} from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class GuardsService {

    constructor(private http: HttpClient, private auth: Auth){}

async addGuard(guardName: string): Promise<void>{
    const user = this.auth.currentUser;
    if(!user) throw new Error('User not logged in');
    const token = await user.getIdToken();
    // const payload = {name: guardName, ownerId: user.uid};
    const payload = {name: guardName};

console.log('📦 Payload to server:', payload);


try{
    await firstValueFrom(this.http.post('http://localhost:3000/api/guards', payload,
        {headers: {Authorization: `Bearer ${token}`}}
    ));
}catch(error){
    console.error('failed to add guard',error);
}
}


    async getGuards():Promise<any[]>{
        const user=this.auth.currentUser;
        if(!user) throw new Error('User not logged in');
        const token= await user.getIdToken();
        const url=`http://localhost:3000/api/guards`;
        return await firstValueFrom(this.http.get<any[]>(url, {headers:{Authorization: `Bearer ${token}`}}));
    }


async getReports(): Promise<any[]> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    const token= await user.getIdToken();
    const url= `http://localhost:3000/api/guards/lastReports`;

    return await firstValueFrom(this.http.get<any[]>(url,
         {headers:{Authorization: `Bearer ${token}`}}));
}

 async getReportsByGuard(guardId: string): Promise<any[]> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not logged in');
    const token = await user.getIdToken();

    // const url = `http://localhost:3000/api/guards/reports/${guardId}`;
    const url = `http://localhost:3000/api/guards/${guardId}/reports`;
    return await firstValueFrom(
      this.http.get<any[]>(url, { headers: { Authorization: `Bearer ${token}` } })
    );
  }



}


