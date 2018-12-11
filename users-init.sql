--
USE bookaplace;

DROP TABLE IF EXISTS `lodgings_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lodgings_users` (
	  `ownerid` mediumint(9) NOT NULL AUTO_INCREMENT,
	  `first_name` varchar(255) NOT NULL,
	  `last_name` varchar(255) NOT NULL,
	  `street` varchar(255) NOT NULL,
	  `city` varchar(255) NOT NULL,
	  `state` char(2) NOT NULL,
	  `zip` char(5) NOT NULL,
	  PRIMARY KEY (`ownerid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;


LOCK TABLES `lodgings_users` WRITE;

INSERT INTO `lodgings_users` VALUES (1,'Bob','Johnson','123 2nd St.','Corvallis','OR','97333'), (2,'Bill','Johnson','7200 NW Grandview Dr.','Corvallis','OR','97330'),  (3,'Aron','Aronsson','546 St Paul St','Burlington','VT','05401');

UNLOCK TABLES;

