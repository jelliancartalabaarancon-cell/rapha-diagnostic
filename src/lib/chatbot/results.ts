import { prisma } from "@/lib/prisma";

export async function getPatientResults(userId:string){

 return await prisma.labResult.findMany({
    where:{
      userId
    },
    select:{
      testName:true,
      dateReleased:true,
      status:true,
      fileUrl:true
    }
 });

}