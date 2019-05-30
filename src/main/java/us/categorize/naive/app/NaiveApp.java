package us.categorize.naive.app;

import java.io.InputStream;
import java.util.Properties;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.servlet.ServletContainer;

import io.swagger.v3.jaxrs2.integration.OpenApiServlet;
import us.categorize.CategorizeUs;
import us.categorize.model.User;
import us.categorize.naive.NaiveUserStore;

public class NaiveApp {

	public static void main(String[] args) throws Exception{
		
		Properties properties = new Properties();
		InputStream input = NaiveApp.class.getResourceAsStream("/categorizeus.properties");
		properties.load(input);
		//note overrideProperties and toLocal in Config, just load another properties files and override with these as desired
		Config config = new Config(properties);
		config.configureCategorizeUs();
		
		/*
		User user = new User();
		user.setUsername("keefe");
		user.setPasshash(NaiveUserStore.sha256hash(NaiveUserStore.sha256hash("35789fb6e")));
		CategorizeUs.instance().getUserStore().registerUser(user);*/
		
        Server server = new Server(config.getPort());

        ServletContextHandler ctx = 
                new ServletContextHandler(ServletContextHandler.SESSIONS);
                
        ctx.setContextPath("/");
        System.out.println("Serving static from " + config.getStaticDir());
        ctx.setResourceBase(config.getStaticDir());

        ServletHolder filesDir = new ServletHolder("files", DefaultServlet.class);
        filesDir.setInitParameter("resourceBase",config.getFileBase());
        filesDir.setInitParameter("pathInfoOnly","true");
        filesDir.setInitParameter("dirAllowed","true");
        ctx.addServlet(filesDir, "/files/*");
        
        ServletHolder openApi = new ServletHolder("openapi", OpenApiServlet.class);
        openApi.setInitOrder(3);
        openApi.setInitParameter("openApi.configuration.resourcePackages", "us.categorize.server,us.categorize.naive.users.server");
        ctx.addServlet(openApi, "/openapi/*");
        
        ServletHolder serHol = ctx.addServlet(ServletContainer.class, "/v1/*");
        serHol.setInitOrder(1);
        serHol.setInitParameter("jersey.config.server.provider.packages", 
                "us.categorize.server;us.categorize.naive.users.server");
        serHol.setInitParameter("jersey.config.server.provider.classnames", 
                "org.glassfish.jersey.media.multipart.MultiPartFeature");
        ctx.addServlet(DefaultServlet.class, "/");
        server.setHandler(ctx);
        
        try {
            server.start();
            server.join();
        } catch (Exception ex) {
           ex.printStackTrace();
        } finally {
            server.destroy();
        }
	}

}
