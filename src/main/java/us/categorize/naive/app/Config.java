package us.categorize.naive.app;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

import us.categorize.CategorizeUs;
import us.categorize.naive.NaiveMessageStore;
import us.categorize.naive.NaiveUserStore;
import us.categorize.naive.api.NaiveAuthorizer;

public class Config {
	public static final int DEFAULT_PAGE_SIZE = 10, DEFAULT_PAGE_ON = 0;
	private String staticDir="~/projects/categorizeus.naive.app/src/main/resources/static";
	private String fileBase="~/projects/files/";
	private String secretsFile = "~/projects/secrets/secrets.properties";//unclear is ~/ will really work
	private String googleClientId, googleClientSecret;
	private String dbHost, dbPort, dbName, dbUser, dbPass;
	private double maxThumbWidth, maxThumbHeight;
	private long maxUploadSize = -1;
	private int port;
	private String attachmentURLPrefix, connectString;
	private String driverName = "org.postgresql.Driver";
	
	public static String toLocal(String linuxPath) {
		//converts a linux style path to local absolute path
		String toHome = linuxPath.replace("~/", System.getProperty("user.home")+File.separator);
		toHome = toHome.replace('/', File.separatorChar);
		System.out.println(toHome);
		return toHome;
	}
	public static void overrideProperties(Properties properties, Properties overrideProperties) {
		for(String secretProperty : overrideProperties.stringPropertyNames()) {
			properties.setProperty(secretProperty, overrideProperties.getProperty(secretProperty));
		}
	}

	
	public Config(Properties properties) {
		this.staticDir = toLocal(this.staticDir);
		this.fileBase = toLocal(this.fileBase);
		this.secretsFile = toLocal(this.secretsFile);
		
		String secretsFile = properties.getProperty("SECRETS_DIR");
		if(!"".equals(secretsFile)) this.secretsFile = secretsFile;
		overrideProperties(properties);
		
		String staticDir = properties.getProperty("STATIC_DIR");
		if(!"".equals(staticDir)) this.staticDir = staticDir;
		String fileBase = properties.getProperty("FILE_BASE");
		if(!"".equals(fileBase)) this.fileBase = fileBase;
		googleClientId = properties.getProperty("GOOGLE_CLIENT_ID");
		googleClientSecret = properties.getProperty("GOOGLE_CLIENT_SECRET");
		dbName = properties.getProperty("DB_NAME");
		dbHost = properties.getProperty("DB_HOST");
		dbPort = properties.getProperty("DB_PORT");
		dbUser = properties.getProperty("DB_USER");
		dbPass = properties.getProperty("DB_PASS");
		fileBase = properties.getProperty("FILE_BASE");
		attachmentURLPrefix = properties.getProperty("ATTACHMENT_URL_PREFIX");
		connectString = "jdbc:postgresql:" + "/" + "/" + dbHost + ":" + dbPort + "/" + dbName;
		maxUploadSize = Long.parseLong(properties.getProperty("MAX_UPLOAD_SIZE"));
		maxThumbWidth = Double.parseDouble(properties.getProperty("MAX_THUMB_WIDTH"));
		maxThumbHeight = Double.parseDouble(properties.getProperty("MAX_THUMB_HEIGHT"));
		port = Integer.parseInt(properties.getProperty("PORT"));
	}
	
	//everything about this method is cringe
	public void configureCategorizeUs() throws ClassNotFoundException, SQLException {
		//clearly does not belong here
		CategorizeUs.instance().setGoogleClientId(this.googleClientId);
		CategorizeUs.instance().setGoogleClientSecret(this.googleClientSecret);

		//TODO note the annoying ordering dependency here
		CategorizeUs.instance().setUserStore(new NaiveUserStore(getDatabaseConnection()));
		CategorizeUs.instance().setMessageStore(new NaiveMessageStore(getDatabaseConnection(), CategorizeUs.instance().getUserStore(), getFileBase()));
		CategorizeUs.instance().setAuthorizer(new NaiveAuthorizer(CategorizeUs.instance().getUserStore()));
	}
	private void overrideProperties(Properties properties) {
		File file = new File(this.secretsFile);
		if(file!=null && file.exists() && !file.isDirectory()) {
			Properties secretProperties = new Properties();
			InputStream input;
			try {
				input = new FileInputStream(file);
				secretProperties.load(input);
				overrideProperties(properties, secretProperties);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	public Connection getDatabaseConnection() throws SQLException, ClassNotFoundException {
		Class.forName(driverName);
		System.out.println("Postgres Driver Loaded");
		System.out.println("Connecting " + getConnectString() + "," + getDbUser() + "," + getDbPass());
		Connection conn = DriverManager.getConnection(getConnectString(), getDbUser(), getDbPass());
		return conn;
	}

	public String getDbHost() {
		return dbHost;
	}

	public void setDbHost(String dbHost) {
		this.dbHost = dbHost;
	}

	public String getDbPort() {
		return dbPort;
	}

	public void setDbPort(String dbPort) {
		this.dbPort = dbPort;
	}

	public String getDbName() {
		return dbName;
	}

	public void setDbName(String dbName) {
		this.dbName = dbName;
	}

	public String getDbUser() {
		return dbUser;
	}

	public void setDbUser(String dbUser) {
		this.dbUser = dbUser;
	}

	public String getDbPass() {
		return dbPass;
	}

	public void setDbPass(String dbPass) {
		this.dbPass = dbPass;
	}

	public String getStaticDir() {
		return staticDir;
	}

	public void setStaticDir(String staticDir) {
		this.staticDir = staticDir;
	}

	public String getFileBase() {
		return fileBase;
	}

	public void setFileBase(String fileBase) {
		this.fileBase = fileBase;
	}

	public double getMaxThumbWidth() {
		return maxThumbWidth;
	}

	public void setMaxThumbWidth(double maxThumbWidth) {
		this.maxThumbWidth = maxThumbWidth;
	}

	public double getMaxThumbHeight() {
		return maxThumbHeight;
	}

	public void setMaxThumbHeight(double maxThumbHeight) {
		this.maxThumbHeight = maxThumbHeight;
	}

	public long getMaxUploadSize() {
		return maxUploadSize;
	}

	public void setMaxUploadSize(long maxUploadSize) {
		this.maxUploadSize = maxUploadSize;
	}

	public int getPort() {
		return port;
	}

	public void setPort(int port) {
		this.port = port;
	}

	public String getAttachmentURLPrefix() {
		return attachmentURLPrefix;
	}

	public void setAttachmentURLPrefix(String attachmentURLPrefix) {
		this.attachmentURLPrefix = attachmentURLPrefix;
	}

	public String getConnectString() {
		return connectString;
	}

	public void setConnectString(String connectString) {
		this.connectString = connectString;
	}

	public String getDriverName() {
		return driverName;
	}

	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
	public String getSecretsFile() {
		return secretsFile;
	}
	public void setSecretsFile(String secretsFile) {
		this.secretsFile = secretsFile;
	}
	public String getGoogleClientId() {
		return googleClientId;
	}
	public void setGoogleClientId(String googleClientId) {
		this.googleClientId = googleClientId;
	}
	public String getGoogleClientSecret() {
		return googleClientSecret;
	}
	public void setGoogleClientSecret(String googleClientSecret) {
		this.googleClientSecret = googleClientSecret;
	}
}
