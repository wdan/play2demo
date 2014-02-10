package models

import scala.collection.mutable._
import scala.io.Source

import play.Play
import play.api.libs.json._

class Graph(var nodes: List[Node], var edges: List[Edge]){

  def this(dataType: String) = {
    this(Graph.initNodes(dataType), Graph.initEdges(dataType))
  }

  def setData(dataType: String) {
    this.nodes = Graph.initNodes(dataType)
    this.edges = Graph.initEdges(dataType)
  }

  def formatedEdges(
    nodes: List[Int] = null,
    highlight: List[Int] = null
  ): String = {
     var jsonEdges = Json.arr()
     for (edge <- this.edges) {
      if (
        nodes == null
        || (nodes.exists(_ == edge.source) && nodes.exists(_ == edge.target))
      ) {
        var jsonEdge = edge.toDict()
        if (
          highlight != null
          && (highlight.exists(_ == edge.source) || highlight.exists(_ == edge.target))
        ) {
          jsonEdge = jsonEdge ++ Json.obj("highlight" -> 1)
        } else {
          jsonEdge = jsonEdge ++ Json.obj("highlight" -> 0)
        }
        jsonEdges = jsonEdges append jsonEdge
      }
    }
    return jsonEdges.toString()
  }

  def formatedNodes(highlight: List[Int] = null): String = {
    var jsonNodes = Json.arr()
    var secondNodes: List[Int] = null
    if (highlight != null) {
      secondNodes = this.findSecondImportantNodes(highlight)
    }
    for (node <- this.nodes) {
      var jsonNode = node.toDict()
      if (highlight == null) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 0)
      } else if (highlight.exists(_ == node.name)) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 3)
      } else if (secondNodes.exists(_ == node.name)) {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 2)
      } else {
        jsonNode = jsonNode ++ Json.obj("highlight" -> 1)
      }
      jsonNodes = jsonNodes append jsonNode
    }
    return jsonNodes.toString()
  }

  private def findSecondImportantNodes(highlight: List[Int]): List[Int] = {
    val nodes = new HashSet[Int]()
    for (edge <- this.edges) {
      if (!(highlight.exists(_ == edge.source) && highlight.exists(_ == edge.target))) {
        if (highlight.exists(_ == edge.source)) {
          nodes += edge.source
        }
        if (highlight.exists(_ == edge.target)) {
          nodes += edge.target
        }
      }
    }
    return nodes.toList
  }

  private def getNodesDegreeDict(): HashMap[Int, Int] = {
    val nodesDict = new HashMap[Int, Int]()
    for (edge <- this.edges) {
      if (nodesDict.contains(edge.source)) {
        nodesDict(edge.source) += 1
      } else {
        nodesDict += (edge.source -> 1)
      }
      if (nodesDict.contains(edge.target)) {
        nodesDict(edge.target) += 1
      } else {
        nodesDict += (edge.target -> 1)
      }
    }
    return nodesDict
  }

  def getNodesByDegree(k: Int): List[Int] = {
    val nodesDict:HashMap[Int, Int] = this.getNodesDegreeDict()
    var nodesDegreeList = nodesDict.toList
    nodesDegreeList = nodesDegreeList.sortBy(e => e._2).reverse
    def f(x: Int, degree: Int) = if (degree >= k) Some(x) else None
    return nodesDegreeList.flatMap(t => f(t._1, t._2))
  }

  private def buildAdjacencyMatrix(): Array[Array[Int]] = {
    val nodesLen = this.nodes.length
    val matrix = Array.ofDim[Int](nodesLen, nodesLen)
    for (edge <- this.edges) {
      matrix(edge.source)(edge.target) = 1
      matrix(edge.target)(edge.source) = 1
    }
    return matrix
  }

  private def calcChildrenNode(
    subtreeNum: List[Int],
    children: List[List[Int]],
    center: Int,
    now: Int,
    maxSteps: Int
  ): Int =  {
    //TODO
    return 0
  }

}

object Graph{

  def initEdges(dataType: String): List[Edge] = {
    val edges: ListBuffer[Edge] = new ListBuffer()
    val data = getEdgeData(dataType)
    for ((x, y) <- data) {
      edges += Edge(x, y)
    }
    return edges.toList
  }

  def initNodes(dataType: String): List[Node] = {
    val nodes: ListBuffer[Node] = new ListBuffer()
    val data = getNodeData(dataType)
    for (e <- data) {
      nodes += Node(e)
    }
    return nodes.toList
  }

  def getEdgeData(dataType: String): List[Tuple2[Int, Int]] = {
    val edgeData = new ListBuffer[Tuple2[Int, Int]]
    val uri: String = (
      if (dataType == "facebook") {
        "/public/data/facebook.txt"
      } else {
        "/public/data/edges.csv"
      }
    )
    val file = Graph.getClass().getResourceAsStream(uri)
    val src = Source.fromInputStream(file)
    for (line <- src.getLines()) {
      val mark: String = if (dataType == "facebook") " " else ","
      val tArray: Array[String] = line.split(mark)
      if (tArray(0).toInt != tArray(1).toInt) {
        edgeData += Tuple2(tArray(0).toInt, tArray(1).toInt)
      }
    }
    return edgeData.toList
  }

  def getNodeData(dataType: String): List[Int] = {
    val nodeData = new ListBuffer[Int]
    if (dataType == "facebook") {
      for (i <- 0 until 5000) {
        nodeData.append(i)
      }
    } else {
      val uri: String = "/public/data/nodes.csv"
      val file = Graph.getClass().getResourceAsStream(uri)
      val src = Source.fromInputStream(file)
      for (line <- src.getLines()) {
        nodeData += line.toInt
      }
    }
    return nodeData.toList
  }

  def starNode(nodeNum: Int): List[Int] = {
    return List(nodeNum)
  }
}
