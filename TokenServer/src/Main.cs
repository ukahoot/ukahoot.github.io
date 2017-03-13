using System;
using System.Threading;
using System.Threading.Tasks;

namespace UKahoot {
	class MainClass {
		public static string[] Hosts = {
			"tokenserver.ukahoot.it",
			"http://tokenserver.ukahoot.it",
			"https://tokenserver.ukahoot.it",
			"http://www.tokenserver.ukahoot.it",
			"https://www.tokenserver.ukahoot.it"
		};
		public static int Port = 443;
		public static TokenServer ts;
		public static void Main(string[] args) {
			ts = new TokenServer(Hosts, Port);
			ts.Init();

			Console.WriteLine("Token server started.");
			Console.WriteLine("Port: " + Port);
			Console.WriteLine("Hosts: " + Hosts.Length);
			Console.WriteLine("Press any key to terminate the server.");
			Console.ReadKey();
			return;
		}
	}
}
