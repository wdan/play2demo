package models

import scala.collection.mutable._
import scala.io.Source

import play.Play

class Graph(val nodes: List[Node], val edges: List[Edge]){
  def this(dataType: String) = {
    this(Graph.initNodes(dataType), Graph.initEdges(dataType))
  }
}

object Graph{
  def initEdges(dataType: String): List[Edge] = {
    val edges: ListBuffer[Edge] = new ListBuffer()
    val data = getEdgeData(dataType)
    for ((x, y) <- data){
      edges += Edge(x, y)
    }
    return edges.toList
  }
  def initNodes(dataType: String): List[Node] = {
    val nodes: ListBuffer[Node] = new ListBuffer()
    val data = getNodeData(dataType)
    for (e <- data){
      nodes += Node(e)
    }
    return nodes.toList
  }
  def getEdgeData(dataType: String): List[Tuple2[Int, Int]] = {
    val edgeData = new ListBuffer[Tuple2[Int, Int]]
    val uri: String = if (dataType == "facebook") "/public/data/facebook.txt" else "/public/data/edges.csv"
    val file = Graph.getClass().getResourceAsStream(uri)
    val src = Source.fromInputStream(file)
    for (line <- src.getLines()){
      val mark: String = if (dataType == "facebook") " " else ","
      val tArray: Array[String] = line.split(mark)
      if (tArray(0).toInt != tArray(1).toInt)
        edgeData += Tuple2(tArray(0).toInt, tArray(1).toInt)
    }
    return edgeData.toList
  }
  def getNodeData(dataType: String): List[Int] = {
    val nodeData = new ListBuffer[Int]
    if (dataType == "facebook"){
      for (i <- 0 until 5000){
        nodeData.append(i)
      }
    }else{
      val uri: String = "/public/data/nodes.csv"
      val file = Graph.getClass().getResourceAsStream(uri)
      val src = Source.fromInputStream(file)
      for (line <- src.getLines()){
        nodeData += line.toInt
      }
    }
    return nodeData.toList
  }
}
