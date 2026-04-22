import handler from "./artifacts/marketing-os/api/campaign/generate";

const req = {
  method: "POST",
  body: undefined // Simulate missing body
} as any;

const res = {
  status: (code: number) => {
    console.log(`Status: ${code}`);
    return res;
  },
  json: (data: any) => {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
} as any;

handler(req, res).then(() => console.log("Done")).catch(err => console.error("Uncaught:", err));
