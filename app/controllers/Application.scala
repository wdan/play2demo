package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._

import models.Graph

object Application extends Controller {

  val graph = new Graph("nothing")

  def index = Action {
    Ok(views.html.index())
  }

  def getData() = Action {
    this.graph.setData("")
    val edges = graph.formatedEdges(null, null)
    val nodes = graph.formatedNodes(null)
    val jsonData = Json.obj(
        "edges" -> edges,
        "nodes" -> nodes
      )
    Ok(jsonData)
  }

  def getKLargeData(k: Int) = Action {
    val highlight = graph.getNodesByDegree(k)
    val edges = graph.formatedEdges(null, highlight)
    val nodes = graph.formatedNodes(highlight)
    val jsonData = Json.obj(
        "edges" -> edges,
        "nodes" -> nodes
      )
    Ok(jsonData)
  }

  def getSingleData(n: Int) = Action {
    val highlight = Graph.starNode(n)
    val edges = graph.formatedEdges(null, highlight)
    val nodes = graph.formatedNodes(highlight)
    val jsonData = Json.obj(
        "edges" -> edges,
        "nodes" -> nodes
      )
    Ok(jsonData)
  }
}
